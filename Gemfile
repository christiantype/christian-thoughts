source "https://rubygems.org"
ruby "3.2.2"

# Core Jekyll
gem "jekyll", "~> 4.3.3"

# Standard library gems
gem "csv"
gem "logger"
gem "base64"
gem "bigdecimal"
gem "webrick"  # Required for Jekyll serve in Ruby 3+

# Theme
gem "minima", "~> 2.5"

# Plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-seo-tag", "~> 2.8"  # Recommended addition
end

# Windows specific gems
install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
  gem "wdm", "~> 0.1.1"
end

# Performance (optional)
gem "neat"