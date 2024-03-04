from typing import Tuple


def get_line_coefficients(x0: float, y0: float, x1: float, y1: float) -> Tuple[float, float]:
    b = (y1 - y0) / (x1 - x0)
    a = y0 - b * x0

    return a, b  # y(x) = a + b * x
