
from unittest.mock import patch, MagicMock

from app.services.gemini_service import get_gemini_client


def test_gemini_client_initialization():
    """Verify the Gemini client initializes without making an API call."""

    with patch(
        "app.services.gemini_service.settings.GEMINI_API_KEY",
        "test-api-key",
    ):
        with patch("google.genai.Client") as mock_client:
            mock_client.return_value = MagicMock()

            client = get_gemini_client()

            assert client is not None
            mock_client.assert_called_once_with(
                api_key="test-api-key"
            )
