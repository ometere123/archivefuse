"""Direct Mode compatibility setup for the pinned Windows test runtime."""
import os
import tempfile


_unlink = os.unlink
_temp_root = os.path.normcase(os.path.abspath(tempfile.gettempdir()))


def _unlink_open_direct_mode_temp(path, *args, **kwargs):
    try:
        return _unlink(path, *args, **kwargs)
    except PermissionError:
        candidate = os.path.normcase(os.path.abspath(os.fspath(path)))
        if os.name == "nt" and candidate.startswith(_temp_root + os.sep):
            return None
        raise


# genlayer-test 0.29.2 unlinks its fd-0 backing file before restoring fd 0;
# Windows correctly rejects that unlink while the descriptor is still open.
if os.name == "nt":
    os.unlink = _unlink_open_direct_mode_temp
