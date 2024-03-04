import funcy


@funcy.contextmanager
def reraise_from_factory(errors, exception_factory):
    """Reraises errors as other exception."""
    if isinstance(errors, list):
        # because `except` does not catch exceptions from list
        errors = tuple(errors)

    try:
        yield
    except errors as e:
        raise exception_factory(e) from e
