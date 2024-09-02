import postcssPresetEnv from 'postcss-preset-env';

const yourConfig = {
	plugins: [
		/* other plugins */
		/* remove autoprefixer if you had it here, it's part of postcss-preset-env */
		postcssPresetEnv({
			/* pluginOptions */
			features: {},
		})
	]
}
