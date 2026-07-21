import json, os, uuid, datetime
OUT = r"D:\MyProject\Genesis_OmniPM\outputs"

# Helper: create a finding object
def F(severity, category, ntitle, title, detail, suggestion, condition=None, dim=None):
    return {
        "id": "F-" + uuid.uuid4().hex[:8],
        "severity": severity,
        "category": category,
        "normalizedTitle": ntitle,
        "title": title,
        "detail": detail,
        "suggestion": suggestion,
        **({"condition": condition} if condition else {}),
        **({"relatedDesignDimension": dim} if dim else {})
    }