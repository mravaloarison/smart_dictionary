from flask import Flask, request, jsonify
from flask_cors import CORS
import PIL.Image as Image
import urllib.request

import google.generativeai as genai
import os as env

genai.configure(api_key=env.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", 
    system_instruction=env.getenv("GEMINI_SYSTEM_INSTRUCTION")
)

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return jsonify({"message": "API running successfully! Testing"})

@app.route("/generate", methods=["POST", "GET"])
def generate():
    if not request.method == "POST":
        return jsonify({"error": "Invalid request method!"})
    
    try:
        data = request.get_json()
        selected_paragraph = data["selected_paragraph"]
        screenshot_url = data["screenshot_url"]

        urllib.request.urlretrieve(screenshot_url, "screenshot.jpg")
        screenshot = Image.open("screenshot.jpg")

        prompt = env.getenv("GEMINI_PROMPT_INSTRUCTION_1"), selected_paragraph, env.getenv("GEMINI_PROMPT_INSTRUCTION_2"), screenshot, env.getenv("GEMINI_PROMPT_INSTRUCTION_3")

        response = gemini_model.generate_content(prompt)

        print("Success")
        return jsonify({"response": response.text})

    except Exception as e:

        print("Error ", str(e))
        return jsonify({"error": str(e)})
