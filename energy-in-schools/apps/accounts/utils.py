from typing import NamedTuple, Tuple


class ModelPermissions(NamedTuple):
    model_name: str

    @property
    def all_permissions(self) -> Tuple[str, ...]:
        return (
            self.add_permission,
            self.change_permission,
            self.delete_permission,
            self.view_permission,
        )

    @property
    def add_permission(self):
        return f'add_{self.model_name.lower()}'

    @property
    def change_permission(self):
        return f'change_{self.model_name.lower()}'

    @property
    def delete_permission(self):
        return f'delete_{self.model_name.lower()}'

    @property
    def view_permission(self):
        return f'view_{self.model_name.lower()}'
