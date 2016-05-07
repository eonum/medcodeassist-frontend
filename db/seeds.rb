# Seed ICDs
puts 'Seeding ICDs'
IcdCode.delete_all
icd_keys = [:code, :short_code, :text_de, :text_fr, :text_it, :version]
csv = CSV.read('db/seeds/icd_codes.csv', col_sep: ',')
csv.shift
csv.each do |row|
  IcdCode.create(Hash[row.map.with_index{|e, i| [icd_keys[i], e]}])
end
IcdCode.where(short_code: nil).each do |drg|
  icd.short_code = icd.code
  icd.save!
end

# Seed CHOPs
puts 'Seeding CHOPs'
ChopCode.delete_all
chop_keys = [:code, :short_code, :text_de, :text_fr, :text_it, :version]
csv = CSV.read('db/seeds/chop_codes.csv', col_sep: ',')
csv.shift
csv.each do |row|
  ChopCode.create(Hash[row.map.with_index{|e, i| [chop_keys[i], e]}])
end
ChopCode.where(short_code: nil).each do |drg|
  chop.short_code = icd.code
  chop.save!
end