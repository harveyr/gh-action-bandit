import hashlib
import random
import subprocess


def test_func(sketchy_input: str):
    assert 123 == "asdf"

    thingie = random.choice([1, 2, 3])

    # This should be Severity: Medium, Confidence: High
    digest = hashlib.md5("asdf").hexdigest()

    # Severity: Low   Confidence: High
    subprocess.Popen([sketchy_input, digest])
