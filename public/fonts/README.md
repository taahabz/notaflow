# Font Files for Notaflow

This directory contains the font files used by Notaflow for the custom font selection feature.

## Included Fonts

1. **Cascadia Mono** - Designed by Aaron Bell for Microsoft
2. **Hubot Sans** - Designed by Tobias Bjerrome Ahlin for GitHub
3. **Rowdies** - Designed by Jaikishan Patel

## Font Loading

These fonts are loaded via CSS and made available to the application through the `FontContext` provider.

## Adding Fonts

To add more fonts:

1. Add the font file to this directory
2. Update the font declarations in `src/styles/fonts.css`
3. Add the new font to the `Font` enum in `src/types/font.ts`
4. Add the font to the available options in `FontContext.tsx`
5. Add the font to the fonts array in the UI component

## License Notes

Please ensure you have the proper licenses to use these fonts in your application.

The setup script (`npm run setup`) will automatically download these fonts from their respective sources. 