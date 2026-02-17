from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    lighthouse_api_key: str | None = os.getenv("LIGHTHOUSE_API_KEY")
    lighthouse_endpoint: str = os.getenv(
        "LIGHTHOUSE_ENDPOINT",
        "https://node.lighthouse.storage/api/v0/add",
    )
    intent_storage_path: Path = Path(
        os.getenv("INTENT_STORAGE_PATH", "./data/latest_intent.json")
    )

    # Flow Blockchain
    flow_access_node: str = os.getenv(
        "FLOW_ACCESS_NODE", "https://rest-testnet.onflow.org"
    )
    flow_private_key: str | None = os.getenv("FLOW_PRIVATE_KEY")
    flow_oracle_address: str = os.getenv(
        "FLOW_ORACLE_ADDRESS", "32258b0c4e249730"
    )
    lazarus_guard_address: str = os.getenv(
        "LAZARUS_GUARD_ADDRESS", "32258b0c4e249730"
    )


settings = Settings()
