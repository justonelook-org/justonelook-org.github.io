---
layout: home
title: Home
nav_order: 1
---

# Welcome to Just One Look!
{: .fs-9 }
*The purpose of our work is to rid humanity of the fear of life, one person at a time*

**Global Information Distribution for Bee Conservation.**
{: .fs-6 .fw-300 }

We are a non-profit organization dedicated to open-source research and education.

[Get Started](/docs/intro/)  {: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View Reports](/downloads/) {: .btn .fs-5 .mb-4 .mb-md-0 }

---

## About This Platform

This site serves as a central repository for our knowledge base. It is designed to be lightweight, accessible on slow connections, and easy to update.

### What you will find here
* **Technical Guides:** How to set up hives in urban environments.
* **Research Papers:** Our latest findings on colony collapse.
* **Community Updates:** News from our volunteers worldwide.

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
