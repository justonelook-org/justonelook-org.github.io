---
layout: default
title: Home
---

<div class="message">
  Welcome to Save the Bees. We are dedicated to global information distribution regarding bee conservation.
</div>

# About Our Mission
This is the central hub for our documentation and news. We are a non-profit organization operating worldwide.

All our work is voluntary and open source. You can find our technical documents, guides, and reports using the menu.

[Read Our History](/about/) &nbsp;&nbsp; [Download Reports](/downloads/)

---

## Latest Updates

<ul>
  {% for post in site.posts limit:5 %}
    <li>
      <a href="{{ post.url }}">
        {{ post.title }}
      </a>
      <span class="post-date" style="color: #999; font-size: 0.8em;">
        - {{ post.date | date: "%B %d, %Y" }}
      </span>
      <p>{{ post.excerpt | remove: '<p>' | remove: '</p>' | truncatewords: 20 }}</p>
    </li>
  {% endfor %}
</ul>

{% if site.posts.size == 0 %}
  <p><em>No news updates yet. Check back soon!</em></p>
{% endif %}