
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');

// Helper to parse env file manually for local test
function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
    return env;
}

const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');
const localEnv = parseEnv(envLocalPath);
const mainEnv = parseEnv(envPath);
const combinedEnv = { ...process.env, ...mainEnv, ...localEnv };
const apiKey = combinedEnv.GEMINI_API_KEY || combinedEnv.API_KEY || combinedEnv.VITE_GEMINI_API_KEY || combinedEnv.VITE_API_KEY;

if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function testGen() {
    const modelId = "gemini-3-pro-image-preview";
    const prompt = "Draw a cute banana character for children.";

    try {
        console.log(`Testing generation with model: ${modelId}`);
        const response = await ai.models.generateContent({
            model: modelId,
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ],
            config: {
                // responseMimeType: "image/png", // Removed as it caused INVALID_ARGUMENT
                sampleCount: 1,
            }
        });

        // success handling...
        console.log("Success!");

    } catch (e) {
        console.error("Test Failed with " + e.message);
        let errorLog = "Error: " + e.message + "\n";
        if (e.response) {
            errorLog += "Response: " + JSON.stringify(e.response, null, 2);
        } else if (e.body) {
            errorLog += "Body: " + e.body;
        } else {
            errorLog += "Full Error Object: " + JSON.stringify(e, Object.getOwnPropertyNames(e));
        }

        fs.writeFileSync(path.resolve(__dirname, 'error_log.txt'), errorLog, 'utf8');
        console.log("Written to error_log.txt");
    }
}

testGen();
