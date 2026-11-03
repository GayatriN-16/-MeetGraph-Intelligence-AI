
from unittest.mock import patch, MagicMock

from app.services.gemini_service import get_gemini_client


def test_gemini_client_initialization():
    """Verify the Gemini client can be initialized without an API call."""

    with patch(
        "app.services.gemini_service.genai.Client"
    ) as mock_client:

        mock_client.return_value = MagicMock()

        client = get_gemini_client()

        assert client is not None
        mock_client.assert_called_once()
