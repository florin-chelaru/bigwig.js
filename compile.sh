# DEPRECATED! Use `ant compile` instead!

./bower_components/google-closure-library/closure/bin/build/depswriter.py --root_with_prefix="src/bigwig ../../../../src/bigwig" > ./deps.js


./bower_components/google-closure-library/closure/bin/build/closurebuilder.py \
  --root=bower_components/google-closure-library/closure/goog/ \
  --root=bower_components/google-closure-library/third_party/closure/goog/ \
  --root=src/bigwig/ \
  --namespace="bigwig"

./bower_components/google-closure-library/closure/bin/build/closurebuilder.py \
  --compiler_flags="--externs=externs/externs.js" \
  --root=bower_components/google-closure-library/closure/goog/ \
  --root=bower_components/google-closure-library/third_party/closure/goog/ \
  --root=src/bigwig/ \
  --namespace="bigwig" \
  --output_mode=compiled \
  --compiler_flags="--js=bower_components/google-closure-library/closure/goog/deps.js" \
  --compiler_flags="--js=deps.js" \
  --compiler_flags="--js=export/bigwig/bigwig-file.js" \
  --compiler_flags="--js=export/bigwig/data-record.js" \
  --compiler_jar=bower_components/closure-compiler/lib/vendor/compiler.jar \
  --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
  --compiler_flags="--js_output_file=bigwig.min.js" \
  --compiler_flags="--create_source_map=bigwig.min.js.map" \
  --compiler_flags="--warning_level=VERBOSE" \
  --compiler_flags="--define=goog.DEBUG=false" \
  --compiler_flags="--summary_detail_level=3" \
  --compiler_flags="--language_in=ECMASCRIPT5_STRICT" \
  --compiler_flags="--source_map_format=V3" \
  --compiler_flags="--output_wrapper='%output% //@ sourceMappingURL=${basename}.map'"
