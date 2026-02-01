import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Exam } from './schemas/exam.schema';
import { SubmitExamDto, StartExamDto } from './dto/exam.dto';
import { PapersService } from '../papers/papers.service';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(
    @InjectModel(Exam.name) private examModel: Model<Exam>,
    private papersService: PapersService,
  ) {}

  // Start exam session
  async startExam(startExamDto: StartExamDto): Promise<any> {
    try {
      const {
        userId,
        paperId,
        deviceInfo,
        startTime,
      } = startExamDto;

      // Generate unique attempt ID
      const examId = uuidv4();

      // Fetch paper to get departmentId
      /* const paper = await this.papersService.findById(paperId);
      if (!paper) {
        throw new NotFoundException(`Paper with ID ${paperId} not found`);
      } */

      // Create exam record with initial state
      await this.examModel.create({
        examId,
        userId,
        paperId,
        responses: [],
        status: 'in-progress',
        startTime,
        deviceInfo,
      });

      return {examId}
    } catch (error) {
      this.logger.error(`Error starting exam: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Failed to start exam');
    }
  }

  // Submit exam answers
  async submitExam(submitExamDto: SubmitExamDto): Promise<any> {
    try {
/*       const {
        attemptId,
        userId,
        paperId,
        responses,
        totalQuestions,
        attemptedQuestions = 0,
        unattemptedQuestions = 0,
        deviceInfo,
        maxScore,
        passingScore,
        remarks,
      } = submitExamDto;

      // Find existing exam attempt
      const exam = await this.examModel.findOne({ attemptId }).exec();
      if (!exam) {
        throw new NotFoundException(`Exam attempt with ID ${attemptId} not found`);
      }

      if (exam.status !== 'in-progress') {
        throw new BadRequestException(
          `Exam attempt ${attemptId} is already ${exam.status}`,
        );
      }

      // Fetch correct answers from papers service
      const answersData = await this.papersService.fetchAnswersForDepartmentPaper(
        exam.departmentId,
        paperId,
      );

      if (!answersData || answersData.length === 0) {
        throw new NotFoundException(
          `No answers found for paper ${paperId}`,
        );
      }

      // Build a map of correct answers
      const correctAnswersMap = new Map();
      answersData[0].answers.forEach((answer: any) => {
        correctAnswersMap.set(answer.id, answer.correct);
      });

      // Evaluate responses
      let correctAnswers = 0;
      responses.forEach((response) => {
        const correctAnswer = correctAnswersMap.get(response.questionId);
        if (correctAnswer !== undefined && response.selectedOption === correctAnswer) {
          correctAnswers++;
        }
      });

      const incorrectAnswers = attemptedQuestions - correctAnswers;
      const score = (correctAnswers / totalQuestions) * maxScore;
      const percentage = (score / maxScore) * 100;
      const accuracy = attemptedQuestions > 0 ? (correctAnswers / attemptedQuestions) * 100 : 0;
      const isPassed = score >= passingScore;

      // Update exam record
      exam.responses = responses;
      exam.attemptedQuestions = attemptedQuestions;
      exam.unattemptedQuestions = unattemptedQuestions;
      exam.correctAnswers = correctAnswers;
      exam.incorrectAnswers = incorrectAnswers;
      exam.score = score;
      exam.percentage = percentage;
      exam.accuracy = accuracy;
      exam.endTime = new Date();
      exam.status = 'submitted';
      exam.isPassed = isPassed;
      exam.remarks = remarks;

      await exam.save();

      this.logger.log(
        `Exam submitted successfully. Attempt ID: ${attemptId}, Score: ${score}/${maxScore}`,
      ); 

      return {
        attemptId,
        score,
        percentage: percentage.toFixed(2),
        accuracy: accuracy.toFixed(2),
        isPassed,
        correctAnswers,
        incorrectAnswers,
        submittedAt: exam.endTime,
      };
    */
    } catch (error) {
      this.logger.error(`Error submitting exam: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Failed to submit exam');
    }
  }
}
