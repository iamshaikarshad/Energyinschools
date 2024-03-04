class SchoolPermission:
    MANAGE_SME_ADMINS = 'accounts.manage_sme_admins'  # school energy management admin
    MANAGE_TEACHERS = 'accounts.manage_teachers'
    MANAGE_PUPILS = 'accounts.manage_pupils'
    MANAGE_ENERGY_SCREEN = 'accounts.manage_energy_screen'
    VIEW_ENERGY_SCREEN = 'accounts.view_energy_screen'


class RoleName:
    ADMIN = 'admin'  # root admin
    SLE_ADMIN = 'sle_admin'  # school learning environment admin
    SEM_ADMIN = 'sem_admin'  # school energy management admin
    TEACHER = 'teacher'  # school teacher
    PUPIL = 'pupil'  # school pupil
    ES_ADMIN = 'es_admin'  # energy screen admin
    ES_USER = 'es_user'  # role for dashboard authentication
    MUG_USER = 'mug_user'  # role for MUG user

    @classmethod
    def get_managed_by_sle_admin(cls):
        return (
            cls.SEM_ADMIN,
            cls.TEACHER,
            cls.PUPIL,
            cls.ES_ADMIN,
        )

    @classmethod
    def get_all_schools_roles(cls):
        return (
            cls.SLE_ADMIN,
            cls.SEM_ADMIN,
            cls.TEACHER,
            cls.PUPIL,
            cls.ES_ADMIN,
            cls.ES_USER,
        )

    @classmethod
    def get_all(cls):
        return (
            RoleName.ADMIN,
            RoleName.MUG_USER,

            *cls.get_all_schools_roles(),
        )


GROUP_NAME_TO_PERMISSION = {
    RoleName.SEM_ADMIN: SchoolPermission.MANAGE_SME_ADMINS,
    RoleName.TEACHER: SchoolPermission.MANAGE_TEACHERS,
    RoleName.PUPIL: SchoolPermission.MANAGE_PUPILS,
    RoleName.ES_ADMIN: SchoolPermission.MANAGE_ENERGY_SCREEN,
    RoleName.ES_USER: SchoolPermission.VIEW_ENERGY_SCREEN,
}
