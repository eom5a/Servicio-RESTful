#!/usr/bin/env python3
"""Vigila las colas virtuales de personajes de Disneyland Paris (API pública
de themeparks.wiki, solo lectura) y avisa por WhatsApp (CallMeBot) y ntfy.sh
cuando una cola pasa a tener plazas. No reserva nada: la reserva es tuya, en la app.

Secretos por variables de entorno (nunca en el código):
  CALLMEBOT_PHONE   p.ej. 34600000000 (con prefijo, sin +)
  CALLMEBOT_APIKEY  clave que te manda CallMeBot
  NTFY_TOPIC        tema privado de ntfy.sh
"""
import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request

API = "https://api.themeparks.wiki/v1/entity/{}/live"
PARKS = {
    "dae968d5-630d-4719-8b06-3d107e944401": "Disneyland Park",
    "ca888437-ebb4-4d50-aed2-d227f7096968": "Disney Adventure World",
}
# Estados de RETURN_TIME que significan "no hay plazas".
CLOSED_STATES = {"FINISHED", "TEMP_FULL", "FULL", "CLOSED"}
UA = {"User-Agent": "disney-character-monitor/1.0 (personal use)"}


def http_get(url, timeout=15):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8")


def fetch_park(park_id, file_path=None):
    if file_path:
        with open(file_path, encoding="utf-8") as f:
            return json.load(f)
    return json.loads(http_get(API.format(park_id)))


def snapshot(data, park_name):
    """{entity_id: {name, park, state, start, end}} para entidades con cola virtual."""
    out = {}
    for e in data.get("liveData", []):
        rt = (e.get("queue") or {}).get("RETURN_TIME")
        if rt is None:
            continue
        out[e["id"]] = {
            "name": e["name"],
            "park": park_name,
            "state": rt.get("state"),
            "start": rt.get("returnStart"),
            "end": rt.get("returnEnd"),
        }
    return out


def is_open(item):
    state = (item["state"] or "").upper()
    return bool(state) and state not in CLOSED_STATES


def fmt_time(iso):
    # "2026-10-06T14:30:00+02:00" -> "14:30"
    return iso[11:16] if iso and len(iso) >= 16 else "?"


def message(item):
    when = ""
    if item["start"]:
        when = f" Vuelta {fmt_time(item['start'])}-{fmt_time(item['end'])}."
    return f"🎟️ {item['name']} ({item['park']}): ¡cola virtual con plazas!{when} Abre la app ya."


def send_whatsapp(text):
    phone, key = os.environ.get("CALLMEBOT_PHONE"), os.environ.get("CALLMEBOT_APIKEY")
    if not (phone and key):
        return False
    q = urllib.parse.urlencode({"phone": phone, "text": text, "apikey": key})
    http_get("https://api.callmebot.com/whatsapp.php?" + q)
    return True


def send_ntfy(text):
    topic = os.environ.get("NTFY_TOPIC")
    if not topic:
        return False
    req = urllib.request.Request(
        "https://ntfy.sh/" + urllib.parse.quote(topic),
        data=text.encode("utf-8"),
        headers={**UA, "Title": "Disney: plazas", "Priority": "urgent", "Tags": "tada"},
    )
    urllib.request.urlopen(req, timeout=15).read()
    return True


def notify(text):
    sent = []
    for name, fn in (("whatsapp", send_whatsapp), ("ntfy", send_ntfy)):
        try:
            if fn(text):
                sent.append(name)
        except Exception as exc:  # un canal caído no debe tapar al otro
            print(f"[warn] {name} falló: {exc}", file=sys.stderr)
    if not sent:
        print("[warn] ningún canal configurado o todos fallaron", file=sys.stderr)
    return sent


def load_state(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_state(path, state):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(state, f)


def poll_once(prev, files):
    """Devuelve (estado_nuevo, [entidades que pasan a abiertas])."""
    cur = {}
    for park_id, park_name in PARKS.items():
        try:
            cur.update(snapshot(fetch_park(park_id, files.get(park_id)), park_name))
        except Exception as exc:
            print(f"[warn] {park_name}: {exc}", file=sys.stderr)
            # Si falla la consulta, conserva lo último conocido de ese parque.
            cur.update({k: v for k, v in prev.items() if v["park"] == park_name})
    opened = [v for k, v in cur.items() if is_open(v) and not (k in prev and is_open(prev[k]))]
    for v in cur.values():
        if (v["state"] or "").upper() not in CLOSED_STATES | {"AVAILABLE"}:
            print(f"[info] estado nuevo/desconocido: {v['name']} = {v['state']}")
    return cur, opened


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--duration", type=int, default=0, help="segundos totales de bucle (0 = una sola consulta)")
    ap.add_argument("--interval", type=int, default=20)
    ap.add_argument("--state", default="state.json")
    ap.add_argument("--test", action="store_true", help="envía un aviso de prueba y sale")
    ap.add_argument("--park-file", action="append", default=[], metavar="PARK_ID=FICHERO",
                    help="usa un JSON local en vez de la API (pruebas)")
    ap.add_argument("--dry-run", action="store_true", help="imprime avisos sin enviarlos")
    args = ap.parse_args()

    if args.test:
        print("enviado por:", notify("✅ Prueba del monitor de Disneyland Paris"))
        return

    files = dict(p.split("=", 1) for p in args.park_file)
    prev = load_state(args.state)
    end = time.time() + args.duration
    while True:
        prev, opened = poll_once(prev, files)
        for item in opened:
            text = message(item)
            print(text)
            if not args.dry_run:
                notify(text)
        save_state(args.state, prev)
        if time.time() + args.interval >= end:
            break
        time.sleep(args.interval)
    watched = ", ".join(sorted(v["name"] for v in prev.values()))
    print(f"vigilando {len(prev)} colas: {watched}")


if __name__ == "__main__":
    main()
