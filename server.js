const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const app = express();
const PORT = 5000;

app.use(express.static('public'));

const docs = [
  { id: 'readme', title: 'README', path: 'README.md' },
  { id: 'mega-prompt', title: 'Mega Prompt', path: 'prompts/mega-prompt-replit.md' },
  { id: 'prisma-schema', title: 'Database Schema', path: 'docs/schema/prisma-schema.md' },
  { id: 'teacher-app', title: 'Teacher App', path: 'docs/interfaces/teacher-app.md' },
  { id: 'parent-portal', title: 'Parent Portal', path: 'docs/interfaces/parent-portal.md' }
];

app.get('/api/docs', (req, res) => {
  res.json(docs.map(d => ({ id: d.id, title: d.title })));
});

app.get('/api/docs/:id', (req, res) => {
  const doc = docs.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  try {
    const content = fs.readFileSync(path.join(__dirname, doc.path), 'utf-8');
    const html = marked(content);
    res.json({ id: doc.id, title: doc.title, html });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read document' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Documentation server running on http://0.0.0.0:${PORT}`);
});
