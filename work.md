---
layout: default
title: "Christian Solorzano's Writing"
description: "Christian Solorzano is a experience designer & consultant, working in the digital landscape."
permalink: /work/
---
  {%- if site.posts.size > 0 -%}
    <h1 class="full-width">{{ page.list_title | default: "Writing" }}</h1>
      {%- for post in site.posts -%}
      <div class="half-container">
        <h4>
          <a class="post-link" href="{{ post.url | relative_url }}">
             <img src="{{ site.baseurl }}../{{ post.image }}" alt="{{ post.title }}" title="{{ post.title }}">
            {{ post.title | escape }}
          </a>
        </h4>
        {%- if site.show_excerpts -%}
          {{ post.excerpt }}
        {%- endif -%}
      </div>
      {%- endfor -%}
  </div>

  {%- endif -%}






