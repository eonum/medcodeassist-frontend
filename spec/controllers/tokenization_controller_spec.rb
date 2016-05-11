require 'spec_helper'
require 'rails_helper'

@@api_url = 'http://pse4.inf.unibe.ch/api/v1/'

describe 'api controllers' do

  it 'has right token structure' do
    tokens = HTTParty.post(@@api_url+'tokenizations', { query: {text: 'anorexia'} } )
    parsed_tokens =  JSON.parse(tokens.body)
    expect(parsed_tokens).to be_an_instance_of(Array)
    if(parsed_tokens.count > 0)
      expect(parsed_tokens[0]).to be_an_instance_of(Hash)
      expect(parsed_tokens[0].size).to be 2
    end
  end

  it 'returns not more than 3 synonyms and has right structure' do
    synonyms = HTTParty.post(@@api_url+'synonyms', { query: {word: 'anorexia', count: 3} } )
    parsed_synonyms = JSON.parse(synonyms.body)

    expect(parsed_synonyms.count).to be <= 3
    expect(parsed_synonyms).to be_an_instance_of(Array)
    if(parsed_synonyms.count > 0)
        expect(parsed_synonyms[0]).to be_an_instance_of(Hash)
        expect(parsed_synonyms[0].size).to be 2
    end
  end

  it 'gets the right code_proposals structures' do
    code_proposals = HTTParty.post(@@api_url+'code_proposals', {query: {codes: %w(F50.0 G24.5), code_types: %w(ICD ICD), text: ''  }})
    parsed_proposals = JSON.parse(code_proposals.body)
    @main_codes = parsed_proposals['main_diagnoses']
    @side_codes = parsed_proposals['side_diagnoses']
    @procedure_codes = parsed_proposals['procedures']

    expect(@main_codes).to be_an_instance_of(Hash)
    expect(@side_codes).to be_an_instance_of(Hash)
    expect(@procedure_codes).to be_an_instance_of(Hash)

    if(@main_codes.size > 0)
      expect(@main_codes.values[0]).to be_an_instance_of(Hash)
      expect(@main_codes.values[0].size).to be 2
    end
    if(@side_codes.size > 0)
      expect(@side_codes.values[0]).to be_an_instance_of(Hash)
      expect(@side_codes.values[0].size).to be 2
    end
    if(@procedure_codes.size > 0)
      expect(@procedure_codes.values[0]).to be_an_instance_of(Hash)
      expect(@procedure_codes.values[0].size).to be 2
    end
  end

end