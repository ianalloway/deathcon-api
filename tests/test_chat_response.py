from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

import main


@pytest.mark.parametrize(
    "content, status, text",
    [
        (
            [
                SimpleNamespace(type="thinking"),
                SimpleNamespace(type="text", text="reply"),
            ],
            200,
            "reply",
        ),
        ([SimpleNamespace(type="text", text="")], 200, ""),
        ([SimpleNamespace(type="thinking")], 502, None),
    ],
)
def test_chat_uses_the_first_text_block(monkeypatch, content, status, text):
    monkeypatch.setenv("DEATHCON_OPERATOR_TOKEN", "test-token")
    monkeypatch.setattr(main, "chat_history", [])
    upstream = Mock()
    upstream.messages.create.return_value.content = content
    monkeypatch.setattr(main, "client", upstream)
    response = TestClient(main.app).post(
        "/chat",
        headers={"Authorization": "Bearer test-token"},
        json={"message": "hello"},
    )
    assert response.status_code == status
    if status == 200:
        assert response.json()["response"] == text
    else:
        assert response.json()["detail"] == "No text returned by the model"
