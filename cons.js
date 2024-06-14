/*
* @jest-environment jsdom
*/

import DocumentIntelligence, { getLongRunningPoller, isUnexpected } from './node_modules/@azure-rest/ai-document-intelligence';
import { AzureKeyCredential } from './node_modules/@azure/core-auth';

const endpoint = "https://planwiseocr123.cognitiveservices.azure.com/";
const apiKey = "7d49801cb8ef4155a8e33b869c7e5ef1";

async function processImage() {
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Please select an image file.');
        return;
    }
    const file = fileInput.files[0];
    console.log('File selected:', file);

    try {
        const imageUrl = await uploadImageToServer(file);
        console.log('Image uploaded, accessible at:', imageUrl);

        const extractedText = await extractTextFromImage(imageUrl);
        console.log('Extracted text:', extractedText);

        const topics = parseTopics(extractedText);
        console.log('Parsed topics:', topics);

        createChecklist(topics);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function uploadImageToServer(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');}

    const data = await response.json();
    console.log(data.imageURL)
    return data.imageUrl;
    // peter parker❌ web developer✔️
} 

async function extractTextFromImage(imageUrl) {
    const client = DocumentIntelligence(endpoint, new AzureKeyCredential(apiKey));

    const initialResponse = await client
        .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
        .post({
            contentType: "application/json",
            body: {
                urlSource: imageUrl
            }
        });

    if (isUnexpected(initialResponse)) {
        throw initialResponse.body.error;
    }

    const poller = await getLongRunningPoller(client, initialResponse);
    const analyzeResult = (await poller.pollUntilDone()).body.analyzeResult;

    const textContent = analyzeResult.readResults.map(page => page.lines.map(line => line.text).join('\n')).join('\n');
    return textContent;
}

function createChecklist(topics) {
    const checklistDiv = document.getElementById('checklist');
    checklistDiv.innerHTML = '';
    topics.forEach(topic => {
        const div = document.createElement('div');
        div.classList.add('checklist-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        const label = document.createElement('label');
        label.textContent = topic;

        div.appendChild(checkbox);
        div.appendChild(label);
        checklistDiv.appendChild(div);
    });
}

function parseTopics(text) {
    return text.split('\n').filter(line => line.trim() !== '');
}

document.getElementById('fileInput').addEventListener('change', processImage);