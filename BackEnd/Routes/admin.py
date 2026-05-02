"""Token-gated admin endpoint for triggering online learning.

POST /admin/update-model
  Header: X-Admin-Token: <value of ADMIN_TOKEN env var>
  Query:  ?full=true  -> run weekly_full_retrain (walk-forward + RandomizedSearchCV)
                        otherwise run incremental_update (warm-start + N new trees)

If ADMIN_TOKEN is unset, the endpoint refuses all calls (fail-closed).
"""

import os

from fastapi import APIRouter, Header, HTTPException, Query

from Controllers.online_learning import (
    append_new_observation,
    incremental_update,
    weekly_full_retrain,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def _check_token(token: str | None) -> None:
    expected = os.environ.get("ADMIN_TOKEN")
    if not expected:
        raise HTTPException(status_code=503, detail="ADMIN_TOKEN not configured on server")
    if token != expected:
        raise HTTPException(status_code=401, detail="invalid or missing X-Admin-Token")


@router.post("/update-model")
async def update_model(
    full: bool = Query(default=False, description="Run a full walk-forward retrain instead of an incremental warm-start update."),
    x_admin_token: str | None = Header(default=None, alias="X-Admin-Token"),
):
    _check_token(x_admin_token)

    appended = append_new_observation()
    if full:
        retrained = weekly_full_retrain()
    else:
        retrained = incremental_update()
    return {"append": appended, "retrain": retrained}
