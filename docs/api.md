# API

All responses are JSON.

## GET /api/results

`200`

```json
{
    "results": [{ "x": 1, "y": "0.5", "r": "3", "hit": true, "timestamp": 1760000000000 }],
    "version": 7,
    "now": 1760000000000,
    "elapsedNs": 48211
}
```

## GET /api/results?since=7

Waits while `version` is still `7`, at most 25 s.

`200` same as GET, when `version` changed.

`204` nothing changed, ask again.

## POST /api/results

Body (`application/x-www-form-urlencoded`): `x=1&y=0.5&r=3`

`201`

```json
{
    "result": { "x": 1, "y": "0.5", "r": "3", "hit": true, "timestamp": 1760000000000 },
    "now": 1760000000000,
    "elapsedNs": 48211
}
```

`400`

```json
{ "errors": { "y": "Y должно быть от -3 до 3." } }
```

## DELETE /api/results

`200`

```json
{ "now": 1760000000000, "elapsedNs": 48211 }
```

POST and DELETE increase `version`.

`elapsedNs` is processing time only. For long polling it does not include waiting.
