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

    @main_codes['C800'] = {code: 'C80.0', short_code: 'C800', text_de: "Bösartige Neubildung, primäre Lokalisation unbekannt, so bezeichnet"}
    @main_codes['C810'] = {code: 'C81.0', short_code: 'C810', text_de: "Noduläres lymphozytenprädominantes Hodgkin-Lymphom"}
    @main_codes['G8210'] = {code: 'G82.10', short_code: 'G8210', text_de: "Spastische Paraparese und Paraplegie: Akute komplette Querschnittlähmung nichttraumatischer Genese"}

    @side_codes = {}
    @side_codes['C152'] = {code: 'C15.2', short_code: 'C152', text_de: "Bösartige Neubildung: Abdominaler Ösophagus"}
    @side_codes['S242'] = {code: 'S24.2', short_code: 'S242', text_de: "Verletzung von Nervenwurzeln der Brustwirbelsäule"}
    @side_codes['E1120'] = {code: 'E11.20', short_code: 'E1120', text_de: "Diabetes mellitus, Typ 2: Mit Nierenkomplikationen: Nicht als entgleist bezeichnet"}


    @procedure_codes = {}
    @procedure_codes['5411'] = {code: '54.11', short_code: '5411', text_de: "Probelaparotomie"}
    @procedure_codes['388410'] = {code: '38.84.10', short_code: '388410', text_de: 'Sonstiger chirurgischer Verschluss der thorakalen Aorta'}
    @procedure_codes['388510'] = {code: '38.85.10', short_code: '388510', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez.'}
    @procedure_codes['388511'] = {code: '38.85.11', short_code: '388511', text_de: 'Sonstiger chirurgischer Verschluss der A. subclavia'}

    @suggested_codes = {mainDiagnoses: @main_codes, sideDiagnoses: @side_codes, procedures: @procedure_codes}

    @selected_codes = params[:selected_codes]

    if(!@selected_codes.nil?)
      @main_codes.delete('G8210')
      @main_codes.delete('C800')
      @main_codes['A666'] = {code: "A66.6", short_code: 'A666', text_de: "Knochen- und Gelenkveränderungen bei Frambösie"}

      @side_codes.delete('C152')
      @side_codes['M8101'] = {code: 'M81.01', short_code: 'M8101', text_de: "Postmenopausale Osteoporose: Schulterregion"}
      @side_codes['M0690'] = {code: 'M06.90', short_code: 'M0690', text_de: "Chronische Polyarthritis, nicht näher bezeichnet: Mehrere Lokalisationen"}

      @procedure_codes['542110'] = {code: '54.21.10', short_code: '542110', text_de: "Laparoskopie, Diagnostische Laparoskopie"}
      @procedure_codes.delete('388410')
      @procedure_codes.delete('388510')
      @procedure_codes.delete('5411')
    end


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
    @main_related_codes['E500'] = {code: 'E50.0', short_code: 'E500', text_de: "Vitamin-A-Mangel mit Xerosis conjunctivae"}

    @side_related_codes = {}
    @side_related_codes['F500'] = {code: 'F50.0', short_code: 'F500', text_de: "Anorexia nervosa"}
    @side_related_codes['G245'] = {code: 'G24.5', short_code: 'G245', text_de: "Blepharospasmus"}

    @procedure_related_codes = {}
    @procedure_related_codes['388510'] = {code: '38.85.10', short_code: '388510', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez.'}
    @procedure_related_codes['388499'] = {code: '38.84.99', short_code: '388499', text_de: 'Sonstiger chirurgischer Verschluss der Aorta, sonstige'}
    @procedure_related_codes['388500'] = {code: '38.85.00', short_code: '388500', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Gefässen, n.n.bez.'}

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
      code.gsub!(/\./, '\.')
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
