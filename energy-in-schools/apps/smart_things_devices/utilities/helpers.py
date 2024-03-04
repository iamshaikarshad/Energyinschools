from typing import Optional, Dict, Any, Callable, Union


def get_key_of_nearest_value(value: Optional[int], values_map: Dict[Any, int],
                             converter: Callable[[Any], Union[int, float]] = int) -> Any:
    value = converter(value)
    return min(values_map.items(), key=lambda pair: abs(pair[1] - value))[0]


def enum_to_dict(a_enum: Any) -> Dict[Any, Any]:
    return {item: item.value for item in a_enum}


def switch_dict_key_values(a_dict: Dict[Any, Any]) -> Any:
    return {value: key for key, value in a_dict.items()}
