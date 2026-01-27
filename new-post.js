/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

const title = process.argv[2] || 'New Post';
const slug = title.toLowerCase().replace(/ /g, '-');
const date = new Date().toISOString();

const template = `---
author: Olly Percival
pubDatetime: ${date}
title: "${title}"
postSlug: ${slug}
featured: false
draft: true
tags:
  - solo
games:
  - 
currentScore: 
description: "Brief summary of the post here."
nowplaying: "Some update on what I'm currently doing in game"
---

Write your intro here...

## Gameplay
Details about the session.
`;

const filePath = path.join('./src/data/blog', `${slug}.md`);
fs.writeFileSync(filePath, template);
console.log(`✅ Post created at ${filePath}`);