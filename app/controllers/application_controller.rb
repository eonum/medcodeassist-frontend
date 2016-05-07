class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  protect_from_forgery with: :null_session

  require 'httparty'
  require 'json'

  @@api_url = 'http://pse4.inf.unibe.ch/api/v1/'

  def index
  end

  def analyse

    @words = ['test']

=begin
  text = params[:text_field]
  tokens = HTTParty.post(@@api_url+'tokenizations', { query: {text: text} } )
  parsed_tokens =  JSON.parse(tokens.body)

  puts "words:"
  @words = parsed_tokens.map {|x| x["word"]}

  code_proposals = HTTParty.post(@@api_url+'code_proposals', {query: {input_codes: { item1: "E11.41", item2: "E51.8"}, input_code_types: {item1: "ICD", item2: "ICD"}, get_icds: true, count: 1  }})
  parsed_codes = JSON.parse(code_proposals.body)

  @code = parsed_codes["icds"][0]["code"]
  @codes = []
  @codes << @code
=end

    @main_codes = {}
    @main_codes['388410'] = {code: '38.84.10', short_code: '388410', text_de: 'Sonstiger chirurgischer Verschluss der thorakalen Aorta'}
    @main_codes['388420'] = {code: '38.84.20', short_code: '388420', text_de: 'Sonstiger chirurgischer Verschluss der Aorta abdominalis'}

    @side_codes = {}
    @side_codes['388499'] = {code: '38.84.99', short_code: '388499', text_de: 'Sonstiger chirurgischer Verschluss der Aorta, sonstige'}
    @side_codes['388500'] = {code: '38.85.00', short_code: '388500', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Gefässen, n.n.bez.'}

    @procedure_codes = {}
    @procedure_codes['388510'] = {code: '38.85.10', short_code: '388510', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez.'}
    @procedure_codes['388511'] = {code: '38.85.11', short_code: '388511', text_de: 'Sonstiger chirurgischer Verschluss der A. subclavia'}

    @suggested_codes = [@main_codes, @side_codes, @procedure_codes]

    @selected_main_codes = params[:selected_main_codes]
    @selected_side_codes = params[:selected_side_codes]
    @selected_procedure_codes = params[:selected_procedure_codes]

    @selected_codes = [@selected_main_codes, @selected_side_codes, @selected_procedure_codes]

    @variables = {}
    @variables['words'] = @words
    @variables['suggested_codes'] = @suggested_codes
    @variables['selected_codes'] = @selected_codes
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.js
    end
  end

  def show_word_details

    @word = params[:word]

    # token = HTTParty.post(@@api_url+'synonyms', { query: {word: @word.gsub('\\', ' '), count: 5} } )
    # parsed_token = JSON.parse(token.body)

    if(@word=='test')
      parsed_token = [{'token' => 'synonym1', similarity: '1'}, {'token' => 'synonym2', similarity: '0'}]
    else
      parsed_token = [{'token' => 'synonym3', similarity: '1'}, {'token' => 'synonym4', similarity: '0'}]
    end

    @synonyms = parsed_token.map {|x| x['token']}

    @variables = {}
    @variables['word'] = @word
    @variables['synonyms'] = @synonyms
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.js
    end

  end

  def search
    search_text = params['search_text']

    @code_matches = IcdCode.any_of({ :code => /.*#{search_text}.*/i}, {:text_de => /.*#{search_text}.*/i}).entries
    @codes = @code_matches.map {|x| x}.take 10

    @variables = {}
    @variables['codes'] = @codes
    @variables['li_id'] = params['li_id']
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.js
    end
  end

end
