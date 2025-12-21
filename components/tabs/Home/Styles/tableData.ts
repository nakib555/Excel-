
import { TableStylePreset } from '../../../../types';

// Helper to generate styles
const createStyle = (
    name: string, 
    cat: 'Light' | 'Medium' | 'Dark', 
    hBg: string, 
    hCol: string, 
    oddBg: string, 
    evenBg: string, 
    border?: string
): TableStylePreset => ({
    name, category: cat, headerBg: hBg, headerColor: hCol, rowOddBg: oddBg, rowEvenBg: evenBg, border
});

// Authentic Excel Colors
export const C = {
    Black: '#000000',
    White: '#FFFFFF',
    Blue: '#4472C4',
    Orange: '#ED7D31',
    Gray: '#A5A5A5',
    Gold: '#FFC000',
    Cyan: '#5B9BD5', 
    Green: '#70AD47',
    
    // Light Bands
    BandBlue: '#D9E1F2',
    BandOrange: '#FCE4D6',
    BandGray: '#EDEDED',
    BandGold: '#FFF2CC',
    BandCyan: '#DDEBF7',
    BandGreen: '#E2EFDA',
    
    // Medium Bands
    MedBlue: '#B4C6E7',
    MedOrange: '#F8CBAD',
    MedGray: '#DBDBDB',
    MedGold: '#FFE699',
    MedCyan: '#BDD7EE',
    MedGreen: '#C6E0B4',
    
    // Dark
    DarkGray: '#595959',
    DarkBlue: '#2F75B5',
    DarkOrange: '#C65911',
    DarkGold: '#BF8F00',
    DarkCyan: '#1F4E78',
    DarkGreen: '#548235',
};

export const TABLE_STYLES: TableStylePreset[] = [
    // --- LIGHT ---
    createStyle('None', 'Light', '#ffffff', '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 1', 'Light', '#ffffff', '#000000', '#ffffff', '#ffffff', '#e2e8f0'), 
    createStyle('Light 2', 'Light', '#ffffff', '#000000', C.BandBlue, '#ffffff'),
    createStyle('Light 3', 'Light', '#ffffff', '#000000', C.BandOrange, '#ffffff'),
    createStyle('Light 4', 'Light', '#ffffff', '#000000', C.BandGray, '#ffffff'),
    createStyle('Light 5', 'Light', '#ffffff', '#000000', C.BandGold, '#ffffff'),
    createStyle('Light 6', 'Light', '#ffffff', '#000000', C.BandCyan, '#ffffff'),
    createStyle('Light 7', 'Light', '#ffffff', '#000000', C.BandGreen, '#ffffff'),
    
    // Row 2
    createStyle('Light 8', 'Light', C.Black, '#ffffff', '#ffffff', '#ffffff'),
    createStyle('Light 9', 'Light', C.Blue, '#ffffff', '#ffffff', '#ffffff'),
    createStyle('Light 10', 'Light', C.Orange, '#ffffff', '#ffffff', '#ffffff'),
    createStyle('Light 11', 'Light', C.Gray, '#ffffff', '#ffffff', '#ffffff'),
    createStyle('Light 12', 'Light', C.Gold, '#ffffff', '#ffffff', '#ffffff'),
    createStyle('Light 13', 'Light', C.Cyan, '#ffffff', '#ffffff', '#ffffff'),
    createStyle('Light 14', 'Light', C.Green, '#ffffff', '#ffffff', '#ffffff'),

    // Row 3
    createStyle('Light 15', 'Light', C.Black, '#ffffff', C.BandGray, '#ffffff'),
    createStyle('Light 16', 'Light', C.Blue, '#ffffff', C.BandBlue, '#ffffff'),
    createStyle('Light 17', 'Light', C.Orange, '#ffffff', C.BandOrange, '#ffffff'),
    createStyle('Light 18', 'Light', C.Gray, '#ffffff', C.BandGray, '#ffffff'),
    createStyle('Light 19', 'Light', C.Gold, '#ffffff', C.BandGold, '#ffffff'),
    createStyle('Light 20', 'Light', C.Cyan, '#ffffff', C.BandCyan, '#ffffff'),
    createStyle('Light 21', 'Light', C.Green, '#ffffff', C.BandGreen, '#ffffff'),

    // --- MEDIUM ---
    createStyle('Medium 1', 'Medium', C.Black, '#ffffff', C.MedGray, '#ffffff'),
    createStyle('Medium 2', 'Medium', C.Blue, '#ffffff', C.MedBlue, '#ffffff'),
    createStyle('Medium 3', 'Medium', C.Orange, '#ffffff', C.MedOrange, '#ffffff'),
    createStyle('Medium 4', 'Medium', C.Gray, '#ffffff', C.MedGray, '#ffffff'),
    createStyle('Medium 5', 'Medium', C.Gold, '#ffffff', C.MedGold, '#ffffff'),
    createStyle('Medium 6', 'Medium', C.Cyan, '#ffffff', C.MedCyan, '#ffffff'),
    createStyle('Medium 7', 'Medium', C.Green, '#ffffff', C.MedGreen, '#ffffff'),
    
    createStyle('Medium 8', 'Medium', C.DarkGray, '#ffffff', C.MedGray, '#ffffff'),
    createStyle('Medium 9', 'Medium', C.DarkBlue, '#ffffff', C.MedBlue, '#ffffff'),
    createStyle('Medium 10', 'Medium', C.DarkOrange, '#ffffff', C.MedOrange, '#ffffff'),
    createStyle('Medium 11', 'Medium', C.Gray, '#ffffff', C.MedGray, '#ffffff'), 
    createStyle('Medium 12', 'Medium', C.DarkGold, '#ffffff', C.MedGold, '#ffffff'),
    createStyle('Medium 13', 'Medium', C.DarkCyan, '#ffffff', C.MedCyan, '#ffffff'),
    createStyle('Medium 14', 'Medium', C.DarkGreen, '#ffffff', C.MedGreen, '#ffffff'),

    createStyle('Medium 15', 'Medium', C.Black, '#ffffff', '#595959', '#808080'),
    createStyle('Medium 16', 'Medium', C.Blue, '#ffffff', '#8EA9DB', '#D9E1F2'),
    createStyle('Medium 17', 'Medium', C.Orange, '#ffffff', '#F4B084', '#FCE4D6'),
    createStyle('Medium 18', 'Medium', C.Gray, '#ffffff', '#C9C9C9', '#EDEDED'),
    createStyle('Medium 19', 'Medium', C.Gold, '#ffffff', '#FFD966', '#FFF2CC'),
    createStyle('Medium 20', 'Medium', C.Cyan, '#ffffff', '#9BC2E6', '#DDEBF7'),
    createStyle('Medium 21', 'Medium', C.Green, '#ffffff', '#A9D08E', '#E2EFDA'),

    createStyle('Medium 22', 'Medium', '#333333', '#ffffff', '#999999', '#CCCCCC'),
    createStyle('Medium 23', 'Medium', '#2F5597', '#ffffff', '#8FAADC', '#B4C6E7'),
    createStyle('Medium 24', 'Medium', '#C65911', '#ffffff', '#F8CBAD', '#FCE4D6'),
    createStyle('Medium 25', 'Medium', '#7B7B7B', '#ffffff', '#D9D9D9', '#F2F2F2'),
    createStyle('Medium 26', 'Medium', '#BF8F00', '#ffffff', '#FFE699', '#FFF2CC'),
    createStyle('Medium 27', 'Medium', '#203864', '#ffffff', '#B4C6E7', '#D9E1F2'),
    createStyle('Medium 28', 'Medium', '#548235', '#ffffff', '#C6E0B4', '#E2EFDA'),

    // --- DARK ---
    createStyle('Dark 1', 'Dark', '#000000', '#ffffff', '#333333', '#000000'),
    createStyle('Dark 2', 'Dark', C.DarkBlue, '#ffffff', '#333F4F', '#222B35'),
    createStyle('Dark 3', 'Dark', '#833C0C', '#ffffff', '#833C0C', '#974706'),
    createStyle('Dark 4', 'Dark', '#595959', '#ffffff', '#262626', '#404040'),
    createStyle('Dark 5', 'Dark', '#806000', '#ffffff', '#525252', '#383838'),
    createStyle('Dark 6', 'Dark', '#203764', '#ffffff', '#161616', '#262626'),
    createStyle('Dark 7', 'Dark', '#375623', '#ffffff', '#424242', '#212121'),
    createStyle('Dark 8', 'Dark', '#000000', '#ffffff', '#262626', '#404040'),
    createStyle('Dark 9', 'Dark', '#4472C4', '#ffffff', '#2F5597', '#203864'),
    createStyle('Dark 10', 'Dark', '#7030A0', '#ffffff', '#56257E', '#3F1B5C'),
    createStyle('Dark 11', 'Dark', '#C00000', '#ffffff', '#940000', '#630000'),
];
