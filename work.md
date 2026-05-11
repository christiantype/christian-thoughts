---
layout: default
title: "Christian Solorzano's Portfolio"
description: "Christian Solorzano is the founder of OP/AL, (Original Practice Applied Learning), a design practice in Oak Park, and the Chicago Graphic Design Club, a community of thousands of designers united by generosity, curiosity, and the belief that design grows stronger and moves forward together. He produces Faculty, a publication on Chicago design, and hosts Underscore, a podcast with over one hundred episodes featuring conversations with designers throughout Chicago. Solorzano teaches at DePaul University, is a practicing photographer, and a trained meditation instructor whose contemplative practice shapes everything he makes. He believes design is never decoration; it is inquiry, consciousness, and transformation."
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






