class FrontEndController < ApplicationController
  require 'httparty'

  def index
  end

  def analyse

    text = params[:text_field].gsub('\\', ' ') # replace '\' with ' ' because api can't handle \ yet

    tokens = HTTParty.post("http://pse4.inf.unibe.ch/api/v1/tokenizations", { query: {text: text} } )
    parsed_tokens =  JSON.parse(tokens.body)

=begin
    synonym = HTTParty.post("http://pse4.inf.unibe.ch/api/v1/synonyms", {query: {word: "mellitus", count: "2"}})
    parsed_synonym = JSON.parse(synonym.body)
=end

    @words = []
    parsed_tokens.each do |x|
      @words << x["word"]
    end

    puts "Parsed tokens:"
    parsed_tokens.each do |element|
      puts element
    end

    code_proposals = HTTParty.post("http://pse4.inf.unibe.ch/api/v1/code_proposals", {query: {input_codes: { item1: "E11.41", item2: "E51.8"}, input_code_types: {item1: "ICD", item2: "ICD"}, get_icds: true, count: 1 }})
    parsed_codes = JSON.parse(code_proposals.body)

    @code = parsed_codes["icds"][0]["code"]

    respond_to do |format|
      format.js
    end
  end

end