import string
import uuid

import funcy


ALPHANUMERIC_SYMBOLS = string.digits + string.ascii_uppercase


@funcy.joining('')
def generate_alphanumeric(length: int = 5) -> str:
    value = uuid.uuid4().int
    for _ in range(length):
        value, module = divmod(value, len(ALPHANUMERIC_SYMBOLS))
        yield ALPHANUMERIC_SYMBOLS[module]
