def parse_int(s):
    try:
        r = int(s)
        return r
    except ValueError:
        return 0


def parse_float(s):
    try:
        r = float(s)
        return r
    except ValueError:
        return 0.0
