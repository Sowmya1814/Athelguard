from app import create_app
from flasgger import Swagger

app = create_app()

# ─── Swagger Configuration ───────────────────────────────────
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint":     "apispec",
            "route":        "/apispec.json",
            "rule_filter":  lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui":       True,
    "specs_route":      "/swagger/",
}

swagger_template = {
    "swagger":  "2.0",
    "info": {
        "title":       "AethelGuard API",
        "description": "AethelGuard - Decentralized Memory Vault API Documentation",
        "version":     "1.0.0",
    },
    "basePath": "/",
    "schemes":  ["http"],
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "securityDefinitions": {
        "Bearer": {
            "type":        "apiKey",
            "name":        "Authorization",
            "in":          "header",
            "description": "JWT token — Format: Bearer your_token_here"
        }
    },
    "tags": [
        {"name": "Auth",    "description": "Register, Login, Forgot Password"},
        {"name": "User",    "description": "User Profile and Vault Status"},
        {"name": "Nominee", "description": "Nominee Access and Vault Viewing"},
        {"name": "Admin",   "description": "Admin User Management"},
        {"name": "Vault",   "description": "Upload and Manage Encrypted Files/Text"},
        # {"name": "Health",  "description": "Server Health Check"},
    ]
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)