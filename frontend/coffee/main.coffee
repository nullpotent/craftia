"use strict"

require.config
	urlArgs: Math.random()
	baseUrl: "js"

	paths:
		"jquery": "../vendor/jquery/jquery.min"
		"handlebars": "../vendor/handlebars/handlebars.min"
		"requireLib" : "../vendor/requirejs/require"

	shim:
		"jquery":
			exports: "$"
		"handlebars":
			exports: "Handlebars"

require [
	"handlebars",
	"jquery"
],

(
	Handlebars,
	$,
) ->
	
	alert("Ovo samo da vidim dal se js izvrsava")