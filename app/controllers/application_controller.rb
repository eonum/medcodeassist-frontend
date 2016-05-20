class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  protect_from_forgery with: :null_session

  require 'httparty'
  require 'json'

  @@api_url = 'http://pse4.inf.unibe.ch/api/v1/'

  def index
  end

  def analyse
    # get post variables
    selected_codes = params[:selected_codes]

    # mockup words and suggested codes
    # use same methods without '_mocked_' if API is ready
    @words = get_mocked_words

    @code_proposals = get_mocked_code_proposals
    @suggested_codes = {mainDiagnoses: @code_proposals[:main_diagnoses], sideDiagnoses: @code_proposals[:side_diagnoses], procedures: @code_proposals[:procedures]}
    # end of mockup words and suggested codes

    # reject selected codes from suggested codes
    if(!selected_codes.nil?)
      selected_codes.each_key do|category|
        if(!selected_codes[category].nil?)
          selected_category_codes = selected_codes[category]
          puts @suggested_codes[category.to_sym]
          @suggested_codes[category.to_sym].reject!{ |entry| selected_category_codes.has_key?(entry) }
        end
      end
    end

    # pass the variables to javascript view
    @variables = {}
    @variables['words'] = @words
    @variables['suggested_codes'] = @suggested_codes
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.json { render :json => @variables_as_json }
    end
  end

  def show_word_details
    # get post variables
    selected_codes = params[:selected_codes]

    # mockup related codes and synonyms
    # use same methods without '_mocked_' if API is ready
    @suggested_related_codes = get_mocked_suggested_related_codes

    @synonyms = get_mocked_synonyms
    # end of mockup related codes and synonyms

    # reject selected codes from suggested codes
    if(!selected_codes.nil?)
      selected_codes.each_key do|category|
        if(!selected_codes[category].nil?)
          selected_category_codes = selected_codes[category]
          @suggested_related_codes[category.to_sym].reject!{ |entry| selected_category_codes.has_key?(entry) }
        end
      end
    end

    # pass the variables to javascript view
    @variables = {}
    @variables['word'] = params[:word]
    @variables['synonyms'] = @synonyms
    @variables['suggested_related_codes'] = @suggested_related_codes
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.json { render :json => @variables_as_json }
    end
  end

  def search
    # get post variables
    search_text = params['search_text'].gsub(/\s\s+/, ' ')
    category = params['category']
    selected_codes = params['selected_codes']

    # determine code pattern based on category
    if(category == 'mainDiagnoses' || category == 'sideDiagnoses')
      codePattern = /(?<code>[a-zA-Z]\d\d?\.?\d{0,2})/ # ICD code pattern
    elsif(category == 'procedures')
      codePattern = /(?<code>\d{1,2}\.?\d?[\w\d]\.?\d{0,2})/ # CHOP code pattern
    end
    # find matched codes
    codeMatch = search_text.match(codePattern)
     if(!codeMatch.nil?)
      code = codeMatch[:code]
      # delete code from search_text for later use
      search_text.delete!(code)
      # escaped regex code for later search in database
      escaped_code = code.gsub(/\./, '\.')
    end

    # text pattern
    textPattern = /(?<text>\w+(\s+\w+)*)/
    # find matched text
    textMatch = search_text.match(textPattern)
    if(!textMatch.nil?)
      text = textMatch[:text]
    end

    # search in the appropriate database based on category
    if(category == 'mainDiagnoses' || category == 'sideDiagnoses')
      @code_matches = IcdCode.any_of({ :code => /.*#{escaped_code}.*/i, :text_de => /.*#{text}.*/i}).entries
    elsif(category == 'procedures')
      @code_matches = ChopCode.any_of({ :code => /.*#{escaped_code}.*/i, :text_de => /.*#{text}.*/i}).entries
    end

    # if selected codes of given category exists then reject them from matched codes
    if(!selected_codes.nil? && !selected_codes[category].nil?)
      sel_codes = selected_codes[category]
      @code_matches.reject! { |entry| sel_codes.has_key?(entry['short_code']) }
    end

    @codes = {}
    # if there are matches send the first 10
    if(!@code_matches.nil?)
      @codes = @code_matches.take 10
    end
    
    # pass the variables to javascript view
    @variables = {}
    @variables['codes'] = @codes.map {|x| {'text_de': x['text_de'], 'code': x['code'], 'short_code': x['short_code']} }
    @variables['code'] = code
    @variables['text'] = text
    @variables['li_id'] = params['li_id']
    @variables_as_json = @variables.to_json

    respond_to do |format|
      format.json { render :json => @variables_as_json }
    end
  end

  private # private methods section

  def get_words
    text = params[:text_field]
    tokens = HTTParty.post(@@api_url+'tokenizations', { query: {text: text} } )
    parsed_tokens =  JSON.parse(tokens.body)
    @words = parsed_tokens.map {|x| x['word']}
  end

  def get_mocked_words
    @words = %w(hodgkin mellitus insipidus laparotomie test)
  end

  def get_code_proposals
    selected_main_diagnoses = params['selected_codes']['mainDiagnoses']
    selected_side_diagnoses = params['selected_codes']['sideDiagnoses']
    selected_procedures = params['selected_codes']['procedures']
    selected_codes_all = selected_main_diagnoses + selected_side_diagnoses + selected_procedures
    code_types = selected_main_diagnoses.map {|x| 'ICD'} + selected_side_diagnoses.map {|x| 'ICD'} + selected_procedures.map {|x| 'CHOP'}
    code_proposals = HTTParty.post(@@api_url+'code_proposals', {query: {codes: selected_codes_all, code_types: code_types, text: text }})
    @parsed_proposals = JSON.parse(code_proposals.body)
  end

  def get_mocked_code_proposals
    @main_codes = {}

    @main_codes['C800'] = {code: 'C80.0', short_code: 'C800', text_de: 'Bösartige Neubildung, primäre Lokalisation unbekannt, so bezeichnet'}
    @main_codes['C81070'] = {code: 'C81.70', short_code: 'C81070', text_de: 'Sonstige Typen des (klassischen) Hodgkin-Lymphoms'}
    @main_codes['G8210'] = {code: 'G82.10', short_code: 'G8210', text_de: 'Spastische Paraparese und Paraplegie: Akute komplette Querschnittlähmung nichttraumatischer Genese'}

    @side_codes = {}
    @side_codes['C152'] = {code: 'C15.2', short_code: 'C152', text_de: 'Bösartige Neubildung: Abdominaler Ösophagus'}
    @side_codes['S242'] = {code: 'S24.2', short_code: 'S242', text_de: 'Verletzung von Nervenwurzeln der Brustwirbelsäule'}
    @side_codes['E1120'] = {code: 'E11.20', short_code: 'E1120', text_de: 'Diabetes mellitus, Typ 2: Mit Nierenkomplikationen: Nicht als entgleist bezeichnet'}


    @procedure_codes = {}
    @procedure_codes['388410'] = {code: '38.84.10', short_code: '388410', text_de: 'Sonstiger chirurgischer Verschluss der thorakalen Aorta'}
    @procedure_codes['388510'] = {code: '38.85.10', short_code: '388510', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez.'}
    @procedure_codes['388511'] = {code: '38.85.11', short_code: '388511', text_de: 'Sonstiger chirurgischer Verschluss der A. subclavia'}

    selected_codes = params[:selected_codes]

    if(!selected_codes.nil?)
      @main_codes.delete('G8210')
      @main_codes.delete('C800')
      @main_codes['A666'] = {code: 'A66.6', short_code: 'A666', text_de: 'Knochen- und Gelenkveränderungen bei Frambösie'}

      @side_codes.delete('C152')
      @side_codes['M8101'] = {code: 'M81.01', short_code: 'M8101', text_de: 'Postmenopausale Osteoporose: Schulterregion'}
      @side_codes['M0690'] = {code: 'M06.90', short_code: 'M0690', text_de: 'Chronische Polyarthritis, nicht näher bezeichnet: Mehrere Lokalisationen'}

      @procedure_codes['542110'] = {code: '54.21.10', short_code: '542110', text_de: 'Laparoskopie, Diagnostische Laparoskopie'}
      @procedure_codes.delete('388410')
      @procedure_codes.delete('388510')
      @procedure_codes.delete('5411')
    end

    @mocked_proposals = {main_diagnoses: @main_codes, side_diagnoses: @side_codes, procedures: @procedure_codes}
  end

  def get_synonyms
    synonyms = HTTParty.post(@@api_url+'synonyms', { query: {word: params[:word], count: 5} } )
    parsed_synonyms = JSON.parse(synonyms.body)
    @synonyms = parsed_synonyms.map {|x| x['name']}
  end

  def get_mocked_synonyms
    word = params[:word]
    if( word !=  'test')
      parsed_token = [{'name' => 'synonym1', similarity: '1'}, {'name' => 'synonym2', similarity: '0'}]
    else
      parsed_token = [{'name' => 'synonym3', similarity: '1'}, {'name' => 'synonym4', similarity: '0'}]
    end
    @synonyms = parsed_token.map {|x| x['name']}
  end

  def get_suggested_related_codes
    word = params[:word]
    code_proposals = HTTParty.post(@@api_url+'code_proposals', {query: {text: word }})
    @parsed_proposals = JSON.parse(code_proposals.body)
  end

  def get_mocked_suggested_related_codes
    @main_related_codes = {}
    @main_related_codes['C800'] = {code: 'C80.0', short_code: 'C800', text_de: 'Bösartige Neubildung, primäre Lokalisation unbekannt, so bezeichnet'}
    @main_related_codes['E500'] = {code: 'E50.0', short_code: 'E500', text_de: 'Vitamin-A-Mangel mit Xerosis conjunctivae'}
    @main_related_codes['C810'] = {code: 'C81.0', short_code: 'C810', text_de: 'Noduläres lymphozytenprädominantes Hodgkin-Lymphom'}

    @side_related_codes = {}
    @side_related_codes['F500'] = {code: 'F50.0', short_code: 'F500', text_de: 'Anorexia nervosa'}
    @side_related_codes['G245'] = {code: 'G24.5', short_code: 'G245', text_de: 'Blepharospasmus'}

    @procedure_related_codes = {}
    @procedure_related_codes['5411'] = {code: '54.11', short_code: '5411', text_de: 'Probelaparotomie'}
    @procedure_related_codes['388510'] = {code: '38.85.10', short_code: '388510', text_de: 'Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez.'}
    @procedure_related_codes['388511'] = {code: '38.85.11', short_code: '388511', text_de: 'Sonstiger chirurgischer Verschluss der A. subclavia'}

    @suggested_related_codes = {mainDiagnoses: @main_related_codes, sideDiagnoses: @side_related_codes, procedures: @procedure_related_codes}
  end

end