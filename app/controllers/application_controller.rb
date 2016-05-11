class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  protect_from_forgery with: :null_session

  require 'httparty'
  require 'json'

  @@api_url = 'http://pse4.inf.unibe.ch/api/v1/'

  def index

    @main_codes = {}
    @side_codes = {}
    @procedure_codes = {}
    @suggested_codes = {mainDiagnoses: @main_codes, sideDiagnoses: @side_codes, procedures: @procedure_codes}

    @variables = {}
    @variables['suggested_codes'] = @suggested_codes
    @variables_as_json = @variables.to_json
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

    @suggested_codes = {mainDiagnoses: @main_codes, sideDiagnoses: @side_codes, procedures: @procedure_codes}

    @selected_codes = params[:selected_codes]

    puts "selected codes:"
    puts @selected_codes

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

    @main_related_codes = {}
    @main_related_codes['388420'] = {code: '38.84.20', short_code: '388420', text_de: 'Sonstiger chirurgischer Verschluss der Aorta abdominalis'}

    @side_related_codes = {}
    @side_related_codes['388499'] = {code: '38.84.99', short_code: '388499', text_de: 'Sonstiger chirurgischer Verschluss der Aorta, sonstige'}

    @procedure_related_codes = {}
    @procedure_related_codes['388510'] = {code: '38.85.10', short_code: '388510', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez.'}

    @suggested_related_codes = {mainDiagnoses: @main_related_codes, sideDiagnoses: @side_related_codes, procedures: @procedure_related_codes}


    # token = HTTParty.post(@@api_url+'synonyms', { query: {word: @word.gsub('\\', ' '), count: 5} } )
    # parsed_token = JSON.parse(token.body)

    if(@word=='test')
      parsed_token = [{'token' => 'synonym1', similarity: '1'}, {'token' => 'synonym2', similarity: '0'}]
    else
      parsed_token = [{'token' => 'synonym3', similarity: '1'}, {'token' => 'synonym4', similarity: '0'}]
    end

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
    search_text = params['search_text'].gsub(/\s\s+/, ' ')
    category = params['category']
    selected_codes = params["selected_codes"]

    if(category == 'mainDiagnoses' || category == 'sideDiagnoses')
      patternCode = /(?<code>[a-zA-Z]\d\d?\.?\d{0,2})/
    elsif(category == 'procedures')
      patternCode = /(?<code>\d{1,2}\.?\d?[\w\d]\.?\d{0,2})/
         end

    codeMatch = search_text.match(patternCode)
    if(!codeMatch.nil?)
      code = codeMatch[:code]
      search_text.delete!(code)
    end

    patternText = /(?<text>\w+(\s\w*)*)/
    textMatch = search_text.match(patternText)
    if(!textMatch.nil?)
      text = textMatch[:text]
    end

    puts "code: #{code}"
    puts "text: #{text}"

    if(category == 'mainDiagnoses' || category == 'sideDiagnoses')
      @code_matches = IcdCode.any_of({ :code => /.*#{code}.*/i, :text_de => /.*#{text}.*/i}).entries
    elsif(category == 'procedures')
      @code_matches = ChopCode.any_of({ :code => /.*#{code}.*/i, :text_de => /.*#{text}.*/i}).entries
    end

    if(!selected_codes.nil?)
      sel_codes = selected_codes[category]
      @code_matches.reject! { |entry| sel_codes.has_key?(entry["short_code"]) }
    end

    if(!@code_matches.nil?)
      @codes = @code_matches.take 10
    else
      @codes = {}
    end

    @variables = {}
    @variables['codes'] = @codes
    @variables['code'] = code
    @variables['text'] = text
    @variables['li_id'] = params['li_id']
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.js
    end
  end

end
