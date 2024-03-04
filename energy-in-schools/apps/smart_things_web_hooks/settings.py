from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from apps.smart_things_web_hooks.handlers import SmartAppInfo


def get_initialize_page_data(smart_app_info: 'SmartAppInfo'):
    return {
        "initialize": {
            "name": smart_app_info.name,
            "description": smart_app_info.description,
            "id": smart_app_info.app_id,
            "permissions": list(smart_app_info.permissions),
            "firstPageId": smart_app_info.first_page_id
        }
    }


def get_config_page_data(username="", password="", input_valid=True):
    return {
        "page": {
            "pageId": "1",
            "name": "Connect Your School",
            "nextPageId": None,
            "previousPageId": None,
            "complete": True,
            "sections": [
                {
                    "name": "School Admin Info",
                    "settings": [
                        {
                            "id": "sle_username",
                            "name": "School Admin Username",
                            "description": "Enter Username" if input_valid else "Wrong Username or Password",
                            "type": "TEXT",
                            "required": True,
                            "defaultValue": f"{username}"
                        },
                        {
                            "id": "sle_password",
                            "name": "School Admin Password",
                            "description": "Enter Password" if input_valid else "Wrong Username or Password",
                            "type": "TEXT",
                            "required": True,
                            "defaultValue": f"{password}"
                        }
                    ]
                }
            ]
        }
    }
