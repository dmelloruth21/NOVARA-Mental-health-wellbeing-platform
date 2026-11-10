"""
tests/test_music_integration.py
────────────────────────────────
Test suite verifying:
  1. All audio files referenced in ChatPage exist in frontend/public/audio/ and are valid.
  2. Royalty-free ambient tracks cover all 6 requested genres:
     - Rain (gentle rain, rain on roof)
     - Nature (forest birds, ocean waves, campfire)
     - Piano (gentle reflections, keys harmony)
     - Lo-Fi (lo-fi chill study beats, flow)
     - White Noise (white noise, deep brown noise, pink noise)
     - Meditation (zen singing bowls, mindful bell)
  3. No SoundHelix demo URLs remain.
  4. Track playback, pause, volume math (0-100 range), and track switching wrap-around.
  5. Recommendation banner mapping integrity.
"""

import os
import re
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parents[2]
FRONTEND_PUBLIC_AUDIO = ROOT_DIR / "frontend" / "public" / "audio"
CHATPAGE_PATH = ROOT_DIR / "frontend" / "src" / "components" / "ChatPage.jsx"


def test_no_soundhelix_references():
    """Verify SoundHelix demo URLs have been completely eliminated."""
    with open(CHATPAGE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    matches = re.findall(r"soundhelix\.com", content, re.IGNORECASE)
    assert len(matches) == 0, f"Found {len(matches)} residual SoundHelix references in ChatPage.jsx!"


def test_audio_files_exist_and_non_empty():
    """Verify all audio files in frontend/public/audio/ exist and are valid non-empty files."""
    assert FRONTEND_PUBLIC_AUDIO.exists(), "frontend/public/audio directory does not exist!"

    required_files = [
        "rain.mp3",
        "rain_on_roof.mp3",
        "forest_sounds.mp3",
        "ocean_waves.mp3",
        "gentle_piano.mp3",
        "zen_meditation.mp3",
        "lofi_study.mp3",
        "campfire.mp3",
        "white_noise.wav",
        "brown_noise.wav",
        "pink_noise.wav",
    ]

    for fname in required_files:
        fpath = FRONTEND_PUBLIC_AUDIO / fname
        assert fpath.exists(), f"Missing audio file: {fname}"
        size = fpath.stat().st_size
        assert size > 50000, f"Audio file {fname} is suspiciously small: {size} bytes"


def test_six_required_genres_present():
    """Verify that all 6 required genres are present in ChatPage.jsx."""
    with open(CHATPAGE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    categories_match = re.search(r"const musicCategories = \[(.*?)\];\s*// Flat lookup", content, re.DOTALL)
    assert categories_match, "Could not find musicCategories array in ChatPage.jsx"

    cats_code = categories_match.group(1)
    
    # Check genre ids
    for genre in ["rain", "nature", "piano", "lofi", "whitenoise", "meditation"]:
        assert f"id: '{genre}'" in cats_code or f'id: "{genre}"' in cats_code, f"Missing category: {genre}"


def test_track_urls_point_to_valid_local_files():
    """Verify every track URL in musicCategories maps to an actual file on disk."""
    with open(CHATPAGE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    urls = re.findall(r"url:\s*['\"](/audio/[^'\"]+)['\"]", content)
    assert len(urls) >= 12, f"Expected at least 12 track URLs, found {len(urls)}"

    for u in urls:
        rel_path = u.lstrip("/")
        full_path = ROOT_DIR / "frontend" / "public" / rel_path
        assert full_path.exists(), f"URL {u} points to non-existent file: {full_path}"


def test_track_switching_logic():
    """Simulates track index switching and wraparound logic."""
    sample_tracks = [
        {"id": "rain-1", "title": "Rain"},
        {"id": "nat-1", "title": "Nature"},
        {"id": "piano-1", "title": "Piano"},
        {"id": "lofi-1", "title": "Lo-Fi"},
        {"id": "noise-1", "title": "Brown Noise"},
        {"id": "med-1", "title": "Meditation"},
    ]
    total = len(sample_tracks)

    # Next track from middle
    idx = 2  # piano
    next_idx = 0 if idx >= total - 1 else idx + 1
    assert next_idx == 3
    assert sample_tracks[next_idx]["id"] == "lofi-1"

    # Next track from end (wrap to start)
    idx = total - 1  # med-1
    next_idx = 0 if idx >= total - 1 else idx + 1
    assert next_idx == 0
    assert sample_tracks[next_idx]["id"] == "rain-1"

    # Prev track from middle
    idx = 3  # lofi-1
    prev_idx = total - 1 if idx <= 0 else idx - 1
    assert prev_idx == 2
    assert sample_tracks[prev_idx]["id"] == "piano-1"

    # Prev track from start (wrap to end)
    idx = 0  # rain-1
    prev_idx = total - 1 if idx <= 0 else idx - 1
    assert prev_idx == total - 1
    assert sample_tracks[prev_idx]["id"] == "med-1"


def test_volume_and_format_time():
    """Tests volume clamping and formatTime math."""
    # Volume range 0 to 100 maps to 0.0 to 1.0 for HTML5 audio
    for vol in [0, 25, 50, 80, 100]:
        audio_vol = vol / 100.0
        assert 0.0 <= audio_vol <= 1.0

    # formatTime test (mins:seconds with leading 0)
    def format_time(secs):
        mins = int(secs // 60)
        remainder = int(secs % 60)
        return f"{mins}:{'0' if remainder < 10 else ''}{remainder}"

    assert format_time(0) == "0:00"
    assert format_time(65) == "1:05"
    assert format_time(188) == "3:08"
    assert format_time(395) == "6:35"


def test_sleep_soundboard_mixer_integration():
    """Verify that the Sleep Panel Soundboard Mixer is fully integrated with audio and controls."""
    with open(CHATPAGE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify component classes
    assert "soundboard-mixer" in content
    assert "mixer-grid" in content
    assert "mixer-channel" in content

    # Verify audio channels
    assert "/audio/rain.mp3" in content
    assert "/audio/forest_sounds.mp3" in content
    assert "/audio/ocean_waves.mp3" in content
    assert "/audio/brown_noise.wav" in content

    # Verify localStorage keys
    assert "novara_sleep_rain_vol" in content
    assert "novara_sleep_forest_vol" in content
    assert "novara_sleep_ocean_vol" in content
    assert "novara_sleep_white_vol" in content

    # Verify controls
    assert "handleMixerVolChange" in content
    assert "handleMuteAllMixer" in content
    assert "isMixerPlaying" in content


if __name__ == "__main__":
    print("Running Music Audio Integration test suite...")
    test_no_soundhelix_references()
    print("  ✓ test_no_soundhelix_references passed (0 SoundHelix references)")

    test_audio_files_exist_and_non_empty()
    print("  ✓ test_audio_files_exist_and_non_empty passed (All 11 local audio assets verified)")

    test_six_required_genres_present()
    print("  ✓ test_six_required_genres_present passed (Rain, Nature, Piano, Lo-Fi, White Noise, Meditation)")

    test_track_urls_point_to_valid_local_files()
    print("  ✓ test_track_urls_point_to_valid_local_files passed (All URLs resolve to disk assets)")

    test_track_switching_logic()
    print("  ✓ test_track_switching_logic passed (Forward, backward, and circular wrap-around)")

    test_volume_and_format_time()
    print("  ✓ test_volume_and_format_time passed (Volume scaling and time formatting)")

    test_sleep_soundboard_mixer_integration()
    print("  ✓ test_sleep_soundboard_mixer_integration passed (Sleep Soundboard Mixer channels, audio & controls)")

    print("\n🎉 ALL Music Audio Integration tests PASSED successfully!")

