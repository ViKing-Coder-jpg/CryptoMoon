import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from Routes.predict import router as predict_router
from Routes.show_btc import router as btc_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(btc_router)


FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "FrontEnd", "dist"))

if os.path.exists(FRONTEND_DIST):
    # Mount assets and other static files
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

# To support React Router (SPA), any route that doesn't match API endpoints serves index.html
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Check if the path requested exists as a file (e.g. favicon.ico, etc)
    potential_file = os.path.join(FRONTEND_DIST, full_path)
    if os.path.isfile(potential_file):
        return FileResponse(potential_file)
    
    # Otherwise, return index.html for React routing
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        # Ensure correct content-type and avoid serving stale cached HTML
        return FileResponse(
            index_file,
            media_type="text/html",
            headers={"Cache-Control": "no-cache"},
        )
    return {"message": "API is online, but frontend not found. Did you run 'npm run build'?"}



if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
