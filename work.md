---
layout: default
title: "Christian Solorzano's Portfolio"
description: "Christian Solorzano is a experience designer & consultant, working in the digital landscape."
permalink: /work/
---
<h1 class="full-width start-third">Projects</h1>
<p class="full-width start-third">These are a collection of projects that demonstrate the breath of my experience. </p>

  {%- if site.posts.size > 0 -%}

      {%- for post in site.posts -%}
      <div class="half-container">
        <p>
          <a class="post-link" href="{{ post.url | relative_url }}">
             <img src="{{ site.baseurl }}../{{ post.image }}" alt="{{ post.title }}" title="{{ post.title }}">
            {{ post.title | escape }}
          </a>
        </p>
        {%- if site.show_excerpts -%}
          {{ post.excerpt }}
        {%- endif -%}
      </div>
      {%- endfor -%}


  {%- endif -%}






