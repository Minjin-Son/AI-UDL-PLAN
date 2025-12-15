
const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to parse env file manually
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

// Load env
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

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    let output = "Available Models:\n";
                    if (jsonData.models) {
                        jsonData.models.forEach(model => {
                            output += `- ${model.name} (${model.displayName}) [${model.supportedGenerationMethods.join(', ')}]\n`;
                        });
                    } else {
                        output += "No models found or error: " + JSON.stringify(jsonData);
                    }
                    fs.writeFileSync(path.resolve(__dirname, '../models_safe.txt'), output, 'utf8');
                    console.log("Written to models_safe.txt");
                    resolve();
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                    reject(e);
                }
            });
        }).on('error', (err) => {
            console.error("Error fetching models:", err);
            reject(err);
        });
    });
}

listModels();
