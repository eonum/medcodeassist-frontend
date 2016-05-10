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
    # API query - uncomment when API is ready
    text = params[:text_field]
    tokens = HTTParty.post(@@api_url+'tokenizations', { query: {text: text} } )
    parsed_tokens =  JSON.parse(tokens.body)
    @words = parsed_tokens.map {|x| x["word"]}

    selected_main_diagnoses = params["selected_codes"]["mainDiagnoses"]
    selected_side_diagnoses = params["selected_codes"]["sideDiagnoses"]
    selected_procedures = params["selected_codes"]["procedures"]
    selected_codes_all = selected_main_diagnoses + selected_side_diagnoses + selected_procedures
    code_types = selected_main_diagnoses.map {|x| "ICD"} + selected_side_diagnoses.map {|x| "ICD"} + selected_procedures.map {|x| "CHOP"}
    code_proposals = HTTParty.post(@@api_url+'code_proposals', {query: {codes: selected_codes_all, code_types: code_types, text: text  }})
    parsed_proposals = JSON.parse(code_proposals.body)
    @main_codes = parsed_proposals["main_diagnoses"]
    @side_codes = parsed_proposals["side_diagnoses"]
    @procedure_codes = parsed_proposals["procedures"]
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

    @suggested_codes = {mainDiagnoses: @main_codes, sideDiagnoses: @side_codes, procedures: @procedure_codes}

    selected_codes = params[:selected_codes]

    puts "selected codes:"
    puts selected_codes
    #{mainDiagnoses: @selected_main_codes, sideDiagnoses: @selected_side_codes, procedures: @selected_procedure_codes}

    @variables = {}
    @variables['words'] = @words
    @variables['suggested_codes'] = @suggested_codes
    @variables['selected_codes'] = selected_codes
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.js
    end
  end

  def show_word_details

    @main_related_codes = {}
    @main_related_codes['388410'] = {code: '38.84.10', short_code: '388410', text_de: 'Sonstiger chirurgischer Verschluss der thorakalen Aorta'}

    @side_related_codes = {}
    @side_related_codes['388499'] = {code: '38.84.99', short_code: '388499', text_de: 'Sonstiger chirurgischer Verschluss der Aorta, sonstige'}

    @procedure_related_codes = {}
    @procedure_related_codes['388510'] = {code: '38.85.10', short_code: '388510', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez.'}

    @suggested_related_codes = {mainDiagnoses: @main_related_codes, sideDiagnoses: @side_related_codes, procedures: @procedure_related_codes}

    if(@word=='test')
      parsed_token = [{'token' => 'synonym1', similarity: '1'}, {'token' => 'synonym2', similarity: '0'}]
    else
      parsed_token = [{'token' => 'synonym3', similarity: '1'}, {'token' => 'synonym4', similarity: '0'}]
    end

=begin
    # API query - uncomment when API is ready
    synonyms = HTTParty.post(@@api_url+'synonyms', { query: {word: params[:word], count: 5} } )
    parsed_synonyms = JSON.parse(synonyms.body)
    @synonyms = parsed_synonyms.map {|x| x['name']}
=end

    @synonyms = parsed_token.map {|x| x['token']}

    @variables = {}
    @variables['word'] = params[:word]
    @variables['synonyms'] = @synonyms
    @variables['suggested_related_codes'] = @suggested_related_codes
    @variables['selected_codes'] = params[:selected_codes]
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.js
    end

  end

  def search
    search_text = params['search_text']

    @code_matches = IcdCode.any_of({ :code => /.*#{search_text}.*/i}, {:text_de => /.*#{search_text}.*/i}).entries
    @codes = @code_matches.take 10

    @variables = {}
    @variables['codes'] = @codes
    @variables['li_id'] = params['li_id']
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.js
    end
  end

end
