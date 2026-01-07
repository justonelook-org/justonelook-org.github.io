---
layout: home
title: Welcome
nav_order: 1
---

# Welcome to Just One Look!
*The purpose of our work is to rid humanity of the fear of life, one person at a time.*

Just One Look is an extremely simple approach to mental suffering unlike anything else you have ever tried. It will rid you of the root cause of your dissatisfaction with life and the painful yearning for peace and fulfillment that seems never to be fully satisfied. Just One Look gives you the means to free yourself of the fear of life and use your own natural intelligence to develop supple and effective control of your mind.

---

### Recent News
<ul>
  {% for post in site.posts limit:3 %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <small>({{ post.date | date: "%Y-%m-%d" }})</small>
    </li>
  {% endfor %}
</ul>
