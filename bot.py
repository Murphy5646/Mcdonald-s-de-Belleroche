import os
import re
import time
import asyncio
from collections import defaultdict, deque

import discord
from discord.ext import commands
from aiohttp import web
from dotenv import load_dotenv

# ======================================
# CONFIGURATION
# ======================================
load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")
OWNER_ID = int(os.getenv("OWNER_ID", "0"))
PORT = int(os.getenv("PORT", "11024"))

# Origines autorisées à appeler l'API (séparées par des virgules dans .env)
ALLOWED_ORIGINS = {
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "https://murphy5646.github.io"
    ).split(",")
    if origin.strip()
}

if not TOKEN:
    raise RuntimeError("La variable DISCORD_TOKEN est manquante.")

if not OWNER_ID:
    raise RuntimeError("La variable OWNER_ID est manquante.")

# Le bot n'a besoin d'aucun intent pour envoyer un MP
intents = discord.Intents.none()
bot = commands.Bot(command_prefix="!", intents=intents)

# Limitation : 3 candidatures par IP toutes les 10 minutes
rate_limits = defaultdict(deque)
RATE_LIMIT = 3
RATE_WINDOW = 600

FIELDS = ["prenom", "nom", "email", "poste", "disponibilites", "motivation"]

LIMITS = {
    "prenom": 50,
    "nom": 60,
    "email": 120,
    "poste": 100,
    "disponibilites": 250,
    "motivation": 1800,
}

EMAIL_REGEX = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")


# ======================================
# CORS
# ======================================
@web.middleware
async def cors_middleware(request, handler):
    origin = request.headers.get("Origin")

    # Les requêtes sans Origin (accès direct, tests) passent.
    # Les navigateurs depuis un autre site sont refusés.
    if origin and origin not in ALLOWED_ORIGINS:
        return web.json_response({"error": "Origine non autorisée"}, status=403)

    if request.method == "OPTIONS":
        response = web.Response(status=204)
    else:
        try:
            response = await handler(request)
        except web.HTTPException as error:
            response = error

    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Vary"] = "Origin"

    return response


# ======================================
# ROUTES SIMPLES
# ======================================
async def home(request):
    return web.json_response({
        "service": "McDonald's de Belleroche",
        "status": "online",
        "routes": ["/health", "/candidature"],
    })


async def health(request):
    return web.json_response({
        "status": "ok",
        "service": "Belleroche API",
        "bot_ready": bot.is_ready(),
    })


# ======================================
# VALIDATION
# ======================================
def validate_application(data):
    if not isinstance(data, dict):
        return None, "Données invalides."

    application = {}

    for field in FIELDS:
        value = data.get(field)

        if not isinstance(value, str):
            return None, f"Champ invalide : {field}"

        value = value.strip()

        if not value:
            return None, f"Le champ {field} est obligatoire."

        if len(value) > LIMITS[field]:
            return None, f"Le champ {field} est trop long."

        application[field] = value

    if not EMAIL_REGEX.fullmatch(application["email"]):
        return None, "Adresse email invalide."

    return application, None


def get_client_ip(request):
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote or "unknown"


# ======================================
# CANDIDATURE
# ======================================
async def candidature(request):
    ip = get_client_ip(request)
    now = time.monotonic()

    bucket = rate_limits[ip]
    while bucket and now - bucket[0] > RATE_WINDOW:
        bucket.popleft()

    if len(bucket) >= RATE_LIMIT:
        return web.json_response(
            {"error": "Trop de candidatures. Réessaie plus tard."},
            status=429,
        )

    try:
        data = await request.json()
    except Exception:
        return web.json_response({"error": "Format JSON invalide."}, status=400)

    application, error = validate_application(data)
    if error:
        return web.json_response({"error": error}, status=400)

    if not bot.is_ready():
        return web.json_response(
            {"error": "Le bot Discord n'est pas encore connecté."},
            status=503,
        )

    try:
        recipient = await bot.fetch_user(OWNER_ID)

        # La motivation va dans la description (limite 4096)
        # car un champ d'embed est limité à 1024 caractères.
        embed = discord.Embed(
            title="Nouvelle candidature",
            description=f"**Motivation :**\n{application['motivation']}",
            color=discord.Color.red(),
        )
        embed.add_field(name="Prénom", value=application["prenom"], inline=True)
        embed.add_field(name="Nom", value=application["nom"], inline=True)
        embed.add_field(name="Adresse email", value=application["email"], inline=False)
        embed.add_field(name="Poste demandé", value=application["poste"], inline=False)
        embed.add_field(
            name="Disponibilités",
            value=application["disponibilites"],
            inline=False,
        )
        embed.set_footer(text="McDonald's de Belleroche - Recrutement")

        await recipient.send(embed=embed)

        bucket.append(now)
        print(f"Nouvelle candidature : {application['prenom']} {application['nom']}")

        return web.json_response({
            "success": True,
            "message": "Candidature envoyée avec succès.",
        })

    except discord.Forbidden:
        print("Erreur : MP bloqués ou aucun serveur en commun avec le bot.")
        return web.json_response(
            {"error": "Impossible d'envoyer le message privé Discord."},
            status=403,
        )

    except discord.HTTPException as error:
        print(f"Erreur Discord : {error}")
        return web.json_response(
            {"error": "Erreur lors de l'envoi sur Discord."},
            status=502,
        )

    except Exception as error:
        print(f"Erreur inattendue : {error}")
        return web.json_response(
            {"error": "Une erreur interne est survenue."},
            status=500,
        )


# ======================================
# DÉMARRAGE DE L'API
# ======================================
async def start_api():
    app = web.Application(
        middlewares=[cors_middleware],
        client_max_size=32 * 1024,
    )

    app.router.add_get("/", home)
    app.router.add_get("/health", health)
    app.router.add_post("/candidature", candidature)

    runner = web.AppRunner(app)
    await runner.setup()

    site = web.TCPSite(runner, "0.0.0.0", PORT)
    await site.start()

    print(f"API démarrée sur 0.0.0.0:{PORT}")
    print(f"Origines autorisées : {', '.join(sorted(ALLOWED_ORIGINS))}")

    return runner


# ======================================
# DISCORD
# ======================================
@bot.event
async def on_ready():
    print(f"Bot connecté : {bot.user}")
    print("Le système de recrutement est opérationnel.")


# ======================================
# PROGRAMME PRINCIPAL
# ======================================
async def main():
    runner = await start_api()
    try:
        await bot.start(TOKEN)
    finally:
        await runner.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
