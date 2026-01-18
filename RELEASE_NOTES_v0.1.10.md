# Release Notes v0.1.10

## Improvements

- Replaced custom SVG icons with professional Lucide React icons
- Improved visual consistency across the application
- Enhanced user interface with more appropriate icons for UML builder
- Better maintainability using a standardized icon library

## Technical Changes

- Added lucide-react as a dependency
- Updated Icons.tsx to use Lucide React components
- Modified Editor, MermaidRenderer and other components to use shared icons
- Maintained backward compatibility with existing functionality

## Files Changed

- package.json: Added lucide-react dependency
- components/Icons.tsx: Replaced custom SVGs with Lucide React icons
- components/Editor.tsx: Updated to use Lucide React icons
- components/MermaidRenderer.tsx: Updated import statements
- Other components using shared icons