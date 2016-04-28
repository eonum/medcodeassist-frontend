class FrontEndController < ApplicationController
  require 'httparty'
  require 'json'

  def index
  end

  def analyse

    text = params[:text_field]#.gsub('\\n', ' ') # replace '\' with ' ' because api can't handle \ yet

    @words = ["test"]

    tokens = HTTParty.post("http://pse4.inf.unibe.ch/api/v1/tokenizations", { query: {text: text} } )
    parsed_tokens =  JSON.parse(tokens.body)

    puts "words:"
    @words = []
    parsed_tokens.each do |x|
      @words << x["word"]
      puts x["word"]
    end

    puts "Parsed tokens:"
    parsed_tokens.each do |element|
      puts element
    end
=begin
    code_proposals = HTTParty.post("http://pse4.inf.unibe.ch/api/v1/code_proposals", {query: {input_codes: { item1: "E11.41", item2: "E51.8"}, input_code_types: {item1: "ICD", item2: "ICD"}, get_icds: true, count: 1  }})
    parsed_codes = JSON.parse(code_proposals.body)

    @code = parsed_codes["icds"][0]["code"]
    @codes = []
    @codes << @code
=end


    @suggestedCodes = {}
    @suggestedCodes["388410"] = {code: "38.84.10", short_code: "388410", text_de: "Sonstiger chirurgischer Verschluss der thorakalen Aorta"}
    @suggestedCodes["388420"] = {code: "38.84.20", short_code: "388420", text_de: "Sonstiger chirurgischer Verschluss der Aorta abdominalis"}
    @suggestedCodes["388499"] = {code: "38.84.99", short_code: "388499", text_de: "Sonstiger chirurgischer Verschluss der Aorta, sonstige"}
    @suggestedCodes["388500"] = {code: "38.85.00", short_code: "388500", text_de: "Sonstiger chirurgischer Verschluss von anderen thorakalen Gefässen, n.n.bez."}
    @suggestedCodes["388510"] = {code: "38.85.10", short_code: "388510", text_de: "Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez."}
    @suggestedCodes["388511"] = {code: "38.85.11", short_code: "388511", text_de: "Sonstiger chirurgischer Verschluss der A. subclavia"}


    @selectedCodes = params[:selectedCodes]

    @variables = {}
    @variables["words"] = @words
    @variables["suggestedCodes"] = @suggestedCodes
    @variables["selectedCodes"] = @selectedCodes
#    @variables["codes"] = @codes

    @variables = @variables.to_json

    respond_to do |format|
      format.js
    end
  end

  def showWordDetails

    @word = params[:word]

    token = HTTParty.post("http://pse4.inf.unibe.ch/api/v1/synonyms", { query: {word: @word.gsub('\\', ' '), count: 5} } )
    parsed_token = JSON.parse(token.body)

    puts "parsed token:"
    puts parsed_token
    # parsed_token = [{name: "synonym1", similarity: "1"}, {name: "synonym2", similarity: "0"}]

    puts "synonyms:"
    @synonyms = []
    parsed_token.each do |x|
      @synonyms << x["token"]
      puts x["token"]
    end

    @variables = {}
    @variables["word"] = @word
    @variables["synonyms"] = @synonyms

    @variables = @variables.to_json

    respond_to do |format|
      format.js
    end

  end

  def search

    search_text = params["search_text"]

    @codes = []
    @code_matches = IcdCode.any_of({ :code => /.*#{search_text}.*/i}, {:text_de => /.*#{search_text}.*/i}).entries
    @code_matches.each do |x|
      if @codes.count < 10
        @codes << x
      else
        break
      end
    end

    puts "Codes: " + @codes.to_s

    @variables = {}
    @variables["codes"] = @codes
    @variables["search_text_id"] = params["search_text_id"]
    @variables = @variables.to_json

    respond_to do |format|
      format.js
    end
  end

end