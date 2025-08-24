from fastapi import FastAPI, HTTPException, Request,UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import httpx
from fastapi.responses import JSONResponse


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from text import text
from website import website
from pdf import Pdf

@app.post("/validate-key")
async def validate_openai_key(request: Request):
    body = await request.json()
    api_key = body.get("apiKey")

    if not api_key:
        raise HTTPException(status_code=400, detail="API key not provided")

    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.openai.com/v1/models", headers=headers)

        if response.status_code == 200:
            return {"valid": True}
        else:
            return {"valid": False, "error": response.json()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post('/validate-qdrant')
async def validate_qdrant(request: Request):
    body = await request.json()
    api_key = body.get('apikey')
    url = body.get('url')

    print('qdrant api key: ', api_key)
    print('qdrant url: ', url)

    if not url:
        return {"valid": False, "error": "qdrantUrl is missing"}

    headers = {
        "Content-Type": "application/json"
    }

    # Determine endpoint path based on whether it's cloud or local
    is_cloud = "cloud.qdrant.io" in url
    if is_cloud:
        headers["Authorization"] = f"Api-Key {api_key}"
        endpoint = "/v1/collections"
    else:
        endpoint = "/collections"

    try:
        url = url.rstrip('/')
        response = httpx.get(f"{url}{endpoint}", headers=headers, timeout=5.0)

        print("Qdrant Status:", response.status_code)
        print("Qdrant Response:", response.text)

        if response.status_code == 200:
            return {"valid": True}
        elif response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid Qdrant API key")
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

    except Exception as e:
        print("❌ Exception during validation:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/text')
async def handleText(request:Request):
    try : 
        body = await request.json()
        Text = body.get('Text')
        user_query = body.get('user_query')
        api_key = body.get('api_key')
        qdrant_url = body.get('qdrant_url')
        qdrant_api_key = body.get('qdrant_api_key')
        print('request is coming to text')
        print(qdrant_url)
        response = text(Text,user_query,api_key,qdrant_url,qdrant_api_key)
        return {'response':response}
    except Exception as e : 
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post('/website')
async def handleWebsite(request:Request):
    body = await request.json()
    website_url = body.get('Text')
    user_query = body.get('user_query')
    api_key = body.get('api_key')
    qdrant_url = body.get('qdrant_url')
    qdrant_api_key = body.get('qdrant_api_key')
    response = website(website_url,user_query,api_key,qdrant_url,qdrant_api_key)
    return {'response':response}

@app.post('/pdf')
async def handlePdf(
    file: UploadFile,
    user_query: str = Form(...),
    api_key: str = Form(...),
    qdrant_url: str = Form(...),
    qdrant_api_key: str = Form(None)
):
    # Save the uploaded file temporarily if needed
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    # Call your Pdf function with the file path
    response = Pdf(file_location, user_query, api_key, qdrant_url, qdrant_api_key)
    print('response in main',response)
    return {"response": response}