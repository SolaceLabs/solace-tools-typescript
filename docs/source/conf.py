# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))


# -- Project information -----------------------------------------------------

project = 'Solace Tools'
copyright = '2023, Solace Corporation'
author = 'Ricardo Gomez-Ulmke'

# The full version, including alpha/beta/rc tags
release = 'r0.0.2'



# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    "sphinx_rtd_theme",
    "sphinxcontrib.contentui"
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = []

datestamp = '%Y-%m-%d %H:%M UTC'
today_fmt = '%d %b %Y at %H:%M'
html_last_updated_fmt = '%d %b %Y at %H:%M'
# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = 'sphinx_rtd_theme'

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
# html_static_path = ['_static']


#
# html_context = {
#     "display_github": True,
#     "github_user": "sensu",
#     "github_repo": "sensu-go-ansible",
#     "github_version": "master",
#     "conf_py_path": "/docs/source/",
# }

linkcheck_anchors = False
linkcheck_ignore = ['https://api.solace.cloud']
# if required, add a list of regex of anchors to ignore
# linkcheck cannot deal with solace swagger anchors like: ...config/index.html#/queue
# linkcheck_anchors_ignore

html_extra_path = ['./_generated']
