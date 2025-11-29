import createHttpError from 'http-errors';
import User from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createHttpError(400, 'No file uploaded');
    }

    const uploadResult = await saveFileToCloudinary(req.file.buffer);
    const avatarUrl = uploadResult.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true },
    );

    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Avatar updated successfully',
      data: {
        url: avatarUrl,
      },
      // Згідно ТЗ просять об'єкт { url: посилання },
      // але зазвичай повертають статус. Підлаштуємо під вимогу:
      url: avatarUrl,
    });
  } catch (err) {
    next(err);
  }
};
